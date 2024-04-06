class PostsController < ApplicationController
  before_action :authenticate_user!, only: %i[new create edit update destroy followings]
  before_action :correct_user, only: %i[update destroy]

  def index
    posts = Post.includes(images_attachments: :blob).latest.limit(10)
    @posts = decorate(posts)
    @post = Post.new
    render :timeline
  end

  def idx_followings
    posts = current_user.following_posts.includes(images_attachments: :blob).latest.limit(10)
    @posts = decorate(posts)
    @post = Post.new
    render :timeline
  end

  def idx_likes
    posts = current_user.liked_posts.includes(images_attachments: :blob).latest.limit(10)
    @posts = decorate(posts)
    @post = Post.new
    render :timeline
  end

  def idx_user
    @user = User.find(params[:id])
    @posts = decorate(@user.posts.includes(images_attachments: :blob).latest.limit(10))
    @post = Post.new
    render :timeline
  end

  def more_posts
    start = params[:start].to_i
    type = params[:type]

    posts = Post.get_posts(type, start, current_user)
    @posts = decorate(posts)
    respond_to do |format|
      format.json { render json: @posts }
    end
  end

  # 投稿に対するユーザー一覧を取得
  def likers
    post = Post.find(params[:id])
    @likers = post.likers
    render json: @likers
  end

  def new
    @post = Post.new
    render :form
  end

  def create
    @post = current_user.posts.build(post_params)
    if @post.save
      redirect_back(fallback_location: root_path, notice: '投稿しました')
    else
      redirect_back(fallback_location: root_path, alert: '投稿に失敗しました')
    end
  end

  def edit
    @post = current_user.posts.find(params[:id])
    render :form
  end

  def update
    puts("⚡️params[:post][:images]: #{params[:post][:images]}") 
    @post = current_user.posts.find(params[:id])
    if @post.update(post_params)
      # Cloudinaryのキーを使用して画像を更新
      puts("⚡️params[:post]: #{params[:post]}") 
      puts("⚡️params[:post][:images]: #{params[:post][:images]}") 
      update_images(@post, params[:post][:images]) # if params[:post][:images] を削除
      redirect_back(fallback_location: root_path, notice: '更新しました')
    else
      redirect_back(fallback_location: root_path, alert: '更新に失敗しました')
    end
  end

  def destroy
    @post.destroy
    redirect_back(fallback_location: root_path, notice: '削除しました')
  end

  # いいね機能 ------------------------------------------------------------------
  def toggle_like
    post = Post.find(params[:id])
    if post.liked_by?(current_user)
      post.unlike_by(current_user)
      render json: { status: 'unliked', count: post.likes_count }
    else
      post.like_by(current_user)
      render json: { status: 'liked', count: post.likes_count }
    end
  end

  helper_method :current_action
  def current_action
    action_name
  end

  private

  def post_params
    params.require(:post).permit(:content, images: [])
  end

  def update_images(post, image_keys)
    image_keys = image_keys.present? ? image_keys.split(',').reject(&:empty?) : []
    post.images.includes(:blob).each do |image|
      # Cloudinaryのキーが送信された画像に含まれていない場合、その画像を削除
      image.purge unless image_keys.include?(image.key)
    end
  end

  def correct_user
    @post = current_user.posts.find_by(id: params[:id])
    redirect_to root_path if @post.nil?
  end

  def decorate(posts)
    users = User.where(id: posts.map(&:user_id)).index_by(&:id)
    liked_posts = current_user ? current_user.liked_post_ids : [] # *_idsメソッドはActiveRecordによって自動生成される
    posts.map do |post|
      merge_info(post, users, liked_posts)
    end
  end

  # フロントで必要な情報をマージ
  def merge_info(post, users, liked_posts)
    user = users[post.user_id]
    # ⚠️ html側でメソッド呼び出しができなくなりモデルメソッドを使えなくなる。
    # これによりビューファイルでは、post.idなどをpost['id']として取得する必要がある。
    post.as_json.merge(
      'username' => user.username.to_s,
      'user_id' => user.id,
      'is_liked' => liked_posts.include?(post.id),
      'is_followed' => current_user&.following?(user),
      # 日本時間のyyyy/mm/dd hh:mm形式に変換
      'updated_at' => post.updated_at.in_time_zone('Tokyo').strftime('%Y/%m/%d %H:%M'),
      'id' => post.id.to_s, # idを文字列に変換
      # 'images' => post.images.map { |image| url_for(image) }
      'images' => post.images.map(&:key)
    )
  end
end
