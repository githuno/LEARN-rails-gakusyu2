require 'rails_helper'

RSpec.describe Post do
  describe 'バリデーション' do
    it 'contentがあれば有効であること' do
      post = build(:post)
      expect(post).to be_valid
    end

    it 'contentがなければ無効であること' do
      post = build(:post, content: nil)
      post.valid?
      expect(post.errors[:content]).to include("can't be blank")
    end

    it 'contentが141文字以上なら無効であること' do
      post = build(:post, content: 'a' * 141)
      post.valid?
      expect(post.errors[:content]).to include('is too long (maximum is 140 characters)')
    end

    it 'contentが140文字なら有効であること' do
      post = build(:post, content: 'a' * 140)
      expect(post).to be_valid
    end
  end
end
