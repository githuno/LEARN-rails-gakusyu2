require 'rails_helper'

RSpec.describe RankingMailer, type: :mailer do
  describe '#daily_ranking' do
    let(:user) { create(:random_user) }
    let(:mail) { described_class.likes_ranking_email(user).deliver_now }

    it 'メールの件名が正しいこと' do
      expect(mail.subject).to eq('いいね数ランキング')
    end

    it '正しい受信者にメールを送信すること' do
      expect(mail.to).to eq([user.email])
    end

    it '送信者のメールアドレスをレンダリングすること' do
      expect(mail.from).to eq(['from@example.com'])
    end
  end
end
