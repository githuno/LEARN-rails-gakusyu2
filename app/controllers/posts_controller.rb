class PostsController < ApplicationController
  before_action :authenticate_user!, only: %i[new create edit update destroy followings]

  def index
    posts = Post.latest.includes(:user, :likes).limit(10)
    @posts = decorate_with_user(posts)
    @post = Post.new
    render :timeline
  end

  def followings
    posts = current_user.following_posts.latest.includes(:user, :likes).limit(10)
    @posts = decorate_with_user(posts)
    @post = Post.new
    render :timeline
  end

  def user
    @user = User.find(params[:id])
    @posts = decorate_with_user(@user.posts.latest.includes(:user, :likes).limit(10))
    @post = Post.new
    render :timeline
  end

  def more_posts
    start = params[:start].to_i
    type = params[:type]

    posts = Post.get_posts(type, start, current_user)
    @posts = decorate_with_user(posts)
    respond_to do |format|
      format.json { render json: @posts }
    end
  end

  def new
    @post = Post.new
    render :form
  end

  def create
    @post = current_user.posts.build(post_params)
    puts "Post Params: #{post_params.inspect}" # パラメータの出力
    if @post.save
      redirect_back(fallback_location: root_path, notice: '投稿しました。')
    else
      puts "Post could not be saved. Errors: #{@post.errors.full_messages}" # 保存失敗とエラーメッセージのログ出力
      redirect_back(fallback_location: root_path, alert: '投稿に失敗しました。')
    end
  end

  def edit
    @post = current_user.posts.find(params[:id])
    render :form
  end

  def update
    @post = current_user.posts.find(params[:id])
    if @post.update(post_params)
      redirect_back(fallback_location: root_path, notice: '更新しました。')
    else
      redirect_back(fallback_location: root_path, alert: '更新に失敗しました。')
    end
  end

  def destroy
    @post = current_user.posts.find(params[:id])
    @post.destroy
    redirect_back(fallback_location: root_path, notice: '削除しました。')
  end

  # いいね機能 ------------------------------------------------------------------
  def toggle_like
    post = Post.find(params[:id])
    if current_user.liked_posts.include?(post)
      post.unlike_by(current_user)
      render json: { status: 'unliked' }
    else
      post.like_by(current_user)
      render json: { status: 'liked' }
    end
  end

  helper_method :current_action
  def current_action
    action_name
  end

  private

  def post_params
    params.require(:post).permit(:content)
  end

  # ユーザー情報をpostにマージするメソッドを定義
  def decorate_with_user(posts)
    # ⚠️ html側でメソッド呼び出しができなくなりモデルメソッドを使えなくなる。post.idなどはpost['id']として取得する
    posts.map do |post|
      post.as_json.merge(
        'following' => current_user&.following?(post.user),
        'username' => post.user.username.to_s,
        'user_id' => post.user.id
      )
    end
  end
end
