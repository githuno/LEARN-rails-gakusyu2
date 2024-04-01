require 'rails_helper'

RSpec.describe 'Comments' do
  let(:user) { create(:random_user) }
  let(:post_obj) { create(:post) }
  let(:comment) { build(:comment, user:, post:) }

  describe 'GET /comments' do
    it '非ログインユーザーもコメント一覧が取得できる' do
      get comments_path(post_obj)
      expect(response).to have_http_status(:ok)
    end
  end

  # 書き方がわからないため保留
  describe 'POST /comments' do
    it 'ログインユーザーはコメントが投稿できる' do
      sign_in user
      post comments_path(post_obj), params: { comment: { content: 'Test Comment' } }
      expect(response).to have_http_status(:created)
    end
  end
end
