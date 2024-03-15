class PostsController < ApplicationController
  before_action :authenticate_user!, only: %i[new create]

  def index
    @posts = Post.all.order(created_at: :desc)
    @post = Post.new
    render :timeline # index.htmlをレンダリングしないように変更
  end

  def new
    @post = Post.new
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

  private

  def post_params
    params.require(:post).permit(:content)
  end
end
