require 'rails_helper'

RSpec.describe Like do
  let(:user) { create(:random_user) }
  let(:post) { create(:post) }
  let(:like) { create(:like, user:, post:) }

  it 'likeされたら投稿のlike数が増える' do
    expect { create(:like, user:, post:) }.to change(post, :likes_count).by(1)
  end

  it 'like済みの投稿にlikeしたらlikeを取り消す' do
    like
    expect { like.destroy }.to change(post, :likes_count).by(-1)
  end

  it '自分の投稿にはlikeおよびunlikeはできない' do
    expect { create(:like, user: post.user, post:) }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it '自分の投稿にlikeしたユーザー一覧を取得できる' do
    like
    expect(post.likers).to include(user)
  end

  it 'likeした投稿一覧を取得できる' do
    like
    expect(user.liked_posts).to include(post)
  end
end
