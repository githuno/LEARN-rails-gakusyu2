namespace :scheduler do
  desc 'Send likes ranking email'
  task send_likes_ranking_email: :environment do
    User.find_each do |user|
      RankingMailer.likes_ranking_email(user).deliver_now
    end
  end
end
