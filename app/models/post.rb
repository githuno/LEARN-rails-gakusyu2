class Post < ApplicationRecord
  validates :content, presence: true, length: { maximum: 140 }
  belongs_to :user

  scope :latest, -> { order(created_at: :desc) }

  def self.get_posts(type, start, user)
    posts = case type
            when 'followings'
              user ? user.following_posts : all
            when 'user'
              user ? user.posts : all
            else
              all
            end
    posts.latest.offset(start).limit(5)
  end

  # いいね機能 ------------------------------------------------------------------
  has_many :likes, dependent: :destroy
  has_many :likers, through: :likes, source: :user

  def like_by(user)
    likes.create(user_id: user.id)
  end

  def unlike_by(user)
    likes.find_by(user_id: user.id).destroy
  end

  def liked_by?(user)
    likers.include?(user)
  end
end
