class PostsController < ApplicationController
  before_action :authenticate_user!, only: %i[new create]

  def index
    @posts = Post.all.order(created_at: :desc)
    @post = Post.new
    render :timeline # index.htmlをレンダリングしないように変更
  end

  def followings
    @posts = current_user.following_posts.order(created_at: :desc)
    @post = Post.new
    render :timeline
  end

  def user
    @user = User.find(params[:id])
    @posts = @user.posts.order(created_at: :desc)
    @post = Post.new
    render :timeline
  end

  helper_method :current_action
  def current_action
    action_name
  end

  def new
    @post = Post.new
    render :form
  end

  def create
    @post = current_user.posts.build(post_params)
    puts "Post Params: #{post_params.inspect}" # パラメータの出力
    if @post.save
      redirect_to posts_path, notice: 'Post was successfully created.'
    else
      puts "Post could not be saved. Errors: #{@post.errors.full_messages}" # 保存失敗とエラーメッセージのログ出力
      redirect_to posts_path, alert: 'Post could not be created.'
    end
  end

  def edit
    @post = current_user.posts.find(params[:id])
    render :form
  end

  def update
    @post = current_user.posts.find(params[:id])
    if @post.update(post_params)
      redirect_to posts_path, notice: 'Post was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @post = current_user.posts.find(params[:id])
    @post.destroy
    redirect_to posts_path, notice: 'Post was successfully destroyed.'
  end

  private

  def post_params
    params.require(:post).permit(:content)
  end
end
