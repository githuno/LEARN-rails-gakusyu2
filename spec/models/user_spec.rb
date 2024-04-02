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

  # ユーザーを削除したらポストも削除されること
  describe 'アソシエーション' do
    let(:user) { create(:user) }
    let(:post) { create(:post, user:) }

    it 'ユーザーを削除したらポストも削除されること' do
      post
      expect { user.destroy }.to change(Post, :count).by(-1)
    end
  end

  # フォロー機能
  describe 'フォロー機能' do
    let(:user) { create(:user) }
    let(:other_user) { create(:random_user) }

    it 'ユーザーをフォローすること' do
      user.follow(other_user)
      expect(user.following?(other_user)).to be_truthy
    end

    it 'ユーザーをフォロー解除すること' do
      user.follow(other_user)
      user.unfollow(other_user)
      expect(user.following?(other_user)).to be_falsey
    end
  end

  # deviceの設定
  describe 'deviceの設定' do
    it 'usernameを利用してログインすること' do
      user = create(:user)
      expect(User.find_for_database_authentication(username: user.username)).to eq user
    end

    it 'usernameが必須であること' do
      user = build(:user, username: nil)
      user.valid?
      expect(user.errors[:username]).to include("can't be blank")
    end

    it 'usernameが一意であること' do
      user = create(:user)
      other_user = build(:user, username: user.username)
      other_user.valid?
      expect(other_user.errors[:username]).to include('has already been taken')
    end
  end
end
