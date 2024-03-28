class User < ApplicationRecord
  # バリデーション（アルファベットのみ、スペース禁止、20文字以内）
  validates :username, presence: true, length: { maximum: 20 },
                       format: { with: /\A[a-zA-Z]*\z/, message: 'only allows letters' }
  # ポスト機能 ----------------------------------------------------------------
  # ユーザーは複数のPostを持ち、ユーザーが削除されたらpostも削除
  has_many :posts, dependent: :destroy

  # フォロー機能 ----------------------------------------------------------------
  # ユーザーは複数のフォローを持ち、ユーザーが削除されたらフォローも削除
  has_many :active_relationships, class_name: 'Relationship', foreign_key: 'follower_id', dependent: :destroy
  # ユーザーは複数のフォロワーを持ち、ユーザーが削除されたらフォロワーも削除
  has_many :passive_relationships, class_name: 'Relationship', foreign_key: 'followed_id', dependent: :destroy
  # ユーザーは複数のフォローを持ち、フォローしているユーザーを取得
  has_many :followings, through: :active_relationships, source: :followed
  has_many :following_posts, through: :followings, source: :posts
  # ユーザーは複数のフォロワーを持ち、フォローされているユーザーを取得
  has_many :followers, through: :passive_relationships, source: :follower

  # ユーザーをフォローする
  def follow(other_user)
    followings << other_user unless self == other_user
  end

  # ユーザーをフォロー解除する
  def unfollow(other_user)
    relationship = active_relationships.find_by(followed_id: other_user.id)
    relationship&.destroy
  end

  # ユーザーがフォローしているかどうか
  def following?(other_user)
    followings.include?(other_user)
  end

  # いいね機能 ------------------------------------------------------------------
  # ユーザーは複数のいいねを持ち、ユーザーが削除されたらいいねも削除
  has_many :likes, dependent: :destroy
  # ユーザーは複数のいいねを持ち、いいねした投稿を取得
  has_many :liked_posts, through: :likes, source: :post

  # deviceの設定 ---------------------------------------------------------------
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         authentication_keys: [:username] # 認証のキーをメールから名前へ

  validates_uniqueness_of :username
  validates_presence_of :username

  # usernameを利用してログイン
  def self.find_first_by_auth_conditions(warden_conditions)
    conditions = warden_conditions.dup
    if (username = conditions.delete(:login))
      where(conditions).where(['username = :value', { value: username }]).first
    else
      where(conditions).first
    end
  end

  def email_required?
    false
  end

  def email_changed?
    false
  end

  def will_save_change_to_email?
    false
  end
end
