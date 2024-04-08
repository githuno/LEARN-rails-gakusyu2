# Preview all emails at http://localhost:3000/rails/mailers/ranking_mailer
class RankingMailerPreview < ActionMailer::Preview
  def likes_ranking_email
    user = User.first
    RankingMailer.likes_ranking_email(user)
  end
end
