class CommentsController < ApplicationController
  before_action :authenticate_user!

  def index
    @post = Post.find(params[:id])
    @comments = @post.comments.order(created_at: :desc)
    render json: @comments
  end

  def create
    @post = Post.find(params[:id])
    @comment = @post.comments.create(comment_params.merge(user_id: current_user.id))
    if @comment.save
      render json: @comment, status: :created
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:content)
  end
end
