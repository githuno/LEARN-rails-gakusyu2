class PostsController < ApplicationController
  def index
    @posts = Post.all.order(created_at: :desc)
    @post = Post.new
    render :timeline # index.htmlをレンダリングしないように変更
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)
    if @post.save
      redirect_to posts_path, notice: 'Post was successfully created.'
    else
      @posts = Post.all.order(created_at: :desc)
      render :timeline
    end
  end

  private

  def post_params
    params.require(:post).permit(:content)
  end
end
