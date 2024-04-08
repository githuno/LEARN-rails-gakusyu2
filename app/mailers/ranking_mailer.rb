class RankingMailer < ApplicationMailer
  def likes_ranking_email(user)
    @user = user
    @app_link = ENV.fetch('APP_LINK', 'https://mac-sonic.tail55100.ts.net:8443/')
    @posts = Post.includes(:user).order(likes_count: :desc).limit(10)
    mail(to: @user.email, subject: 'いいね数ランキング')
  end
end
