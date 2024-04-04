class RankingMailer < ApplicationMailer
  def likes_ranking_email(user)
    @user = user
    @posts = Post.includes(:user).order(likes_count: :desc).limit(10)
    mail(to: @user.email, subject: 'いいね数ランキング')
  end
end
