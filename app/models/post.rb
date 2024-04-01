class Post < ApplicationRecord
  validates :content, presence: true, length: { maximum: 140 }
  belongs_to :user

  scope :latest, -> { order(created_at: :desc) }

  def self.get_posts(type, start, user)
    post_types = {
      'followings' => user&.following_posts,
      'likes' => user&.liked_posts,
      'user' => user&.posts
    }
    posts = post_types[type] || all
    posts.latest.offset(start).limit(5)
  end

  # いいね機能 ------------------------------------------------------------------
  has_many :likes, dependent: :destroy # 投稿は複数のいいねを持ち、投稿が削除されたらいいねも削除
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

  def likes_count
    self[:likes_count]
  end

  # コメント機能 ----------------------------------------------------------------
  has_many :comments, dependent: :destroy # 投稿は複数のコメントを持ち、投稿が削除されたらコメントも削除
end
