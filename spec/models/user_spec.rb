require 'rails_helper'

RSpec.describe User do
  # ユーザー名（アルファベットのみ、スペース禁止、20文字以内）
  describe 'バリデーション' do
    it 'usernameがあれば有効であること' do
      user = build(:user, username: 'testuser')
      expect(user).to be_valid
    end

    it 'usernameがなければ無効であること' do
      user = build(:user, username: nil)
      user.valid?
      expect(user.errors[:username]).to include("can't be blank")
    end

    it 'usernameが20文字以上なら無効であること' do
      user = build(:user, username: 'a' * 21)
      user.valid?
      expect(user.errors[:username]).to include('is too long (maximum is 20 characters)')
    end

    it 'usernameが20文字なら有効であること' do
      user = build(:user, username: 'a' * 20)
      expect(user).to be_valid
    end

    it 'usernameがアルファベット以外なら無効であること' do
      user = build(:user, username: 'あ')
      user.valid?
      expect(user.errors[:username]).to include('only allows letters')
    end

    it 'usernameがスペースを含むなら無効であること' do
      user = build(:user, username: 'a a')
      user.valid?
      expect(user.errors[:username]).to include('only allows letters')
    end
  end
end
