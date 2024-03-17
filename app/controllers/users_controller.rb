class UsersController < ApplicationController
  before_action :authenticate_user!, only: %i[edit update follow unfollow]

  def show
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      redirect_to user_path(@user)
    else
      render 'show'
    end
  end

  def follow
    user = User.find(params[:id])
    current_user.follow(user)
    redirect_to posts_path
  end

  def unfollow
    user = User.find(params[:id])
    current_user.unfollow(user)
    redirect_to posts_path
  end

  private

  def user_params
    params.require(:user).permit(:username, :profile, :blog_url)
  end
end
