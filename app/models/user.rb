class User < ApplicationRecord
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
    if username = conditions.delete(:login)
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

  # バリデーション（アルファベットのみ、スペース禁止、20文字以内）
  validates :username, presence: true, length: { maximum: 20 },
                       format: { with: /\A[a-zA-Z]*\z/, message: 'only allows letters' }

  # ユーザーは複数のPostを持ち、ユーザーが削除されたらpostも削除
  has_many :posts, dependent: :destroy
end
