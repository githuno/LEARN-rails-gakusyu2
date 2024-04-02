require 'rails_helper'

RSpec.describe Comment do
  let(:user) { create(:random_user) }
  let(:post) { create(:post) }
  let(:comment) { create(:comment, user:, post:) }

  it 'コメントが投稿される' do
    expect(comment).to be_valid
  end

  it 'コメントが140文字以内である' do
    comment.content = 'a' * 141
    expect(comment).not_to be_valid
  end

  it 'コメントが1文字以上である' do
    comment.content = ''
    expect(comment).not_to be_valid
  end

  # it 'コメントが削除される' do
  #   comment
  #   expect { comment.destroy }.to change(Comment, :count).by(-1)
  # end

  # it 'コメントされるとメールが送信される' do
  #   comment
  #   expect(ActionMailer::Base.deliveries.size).to eq(1)
  # end
end
