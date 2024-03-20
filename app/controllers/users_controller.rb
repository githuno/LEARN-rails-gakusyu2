class UsersController < ApplicationController
  before_action :authenticate_user!, only: %i[edit update follow unfollow]

  def show
    @user = User.find(params[:id])
  end

  def show_json
    @target_user = User.find(params[:id])
    @current_user = current_user
    is_followed = @current_user&.following?(@target_user)
    render json: @target_user.as_json.merge(is_followed:)
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      flash[:notice] = 'プロフィールを更新しました'
      redirect_to user_path(@user)
    else
      flash[:alert] = 'プロフィールの更新に失敗しました'
      render 'show'
    end
  end

  def toggle_follow
    user = User.find(params[:id])
    if current_user.following?(user)
      current_user.unfollow(user)
      render json: { status: 'unfollowed' }
    else
      current_user.follow(user)
      render json: { status: 'followed' }
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :profile, :blog_url)
  end
end
