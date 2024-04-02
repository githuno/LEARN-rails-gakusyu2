require 'rails_helper'

RSpec.describe CommentMailer do
  describe 'new_comment_email' do
    let(:user) { create(:random_user) }
    let(:post) { create(:post) }
    let(:comment) { create(:comment, user:) }
    let(:mail) { described_class.new_comment_email(comment) }

    it 'renders the headers' do
      expect(mail.subject).to eq('新しいコメントが投稿されました')
      expect(mail.to).to eq([user.email])
      expect(mail.from).to eq(['from@example.com'])
    end
  end
end
