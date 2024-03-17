require 'rails_helper'

RSpec.describe 'Posts' do
  let(:user) { create(:user) }
  let(:user_post) { create(:post, user:) }

  describe 'GET /new' do
    context '非ログインユーザーの場合' do
      it 'ログインページにリダイレクトされる' do
        get new_post_path
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context 'ログインユーザーの場合' do
      before do
        sign_in user
      end

      it '新規投稿ページが表示される' do
        get new_post_path
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe 'GET /edit' do
    context '非ログインユーザーの場合' do
      it 'ログインページにリダイレクトされる' do
        get edit_post_path(user_post)
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end

  describe 'POST /posts' do
    context '非ログインユーザーの場合' do
      it 'ログインページにリダイレクトされる' do
        post posts_path, params: { post: { content: 'テスト投稿' } }
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context 'ログインユーザーの場合' do
      before do
        sign_in user
      end

      it '投稿が保存される' do
        expect do
          post posts_path, params: { post: { content: 'テスト投稿' } }
        end.to change(user.posts, :count).by(1)
      end
    end
  end
end
