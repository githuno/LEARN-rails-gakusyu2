require 'rails_helper'

RSpec.describe Like do
  let(:user) { create(:random_user) }
  let(:post) { create(:post) }
  let(:like) { create(:like, user:, post:) }

  #   いいねされたら投稿のいいね数が増える
  it 'いいねされたら投稿のいいね数が増える' do
    expect { create(:like, user:, post:) }.to change(post, :likes_count).by(1)
  end

  #   いいね済みの投稿にいいねしたらいいねを取り消す
  it 'いいね済みの投稿にいいねしたらいいねを取り消す' do
    like = create(:like, user:, post:)
    expect { like.destroy }.to change(post, :likes_count).by(-1)
  end

  #   いいねしたユーザーを取得できる
  #   いいねした投稿を取得できる
end
