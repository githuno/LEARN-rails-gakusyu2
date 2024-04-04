class Post < ApplicationRecord
  validates :content, presence: true, length: { maximum: 140 }
  validate :image_count
  validates :image, content_type: { in: %w[image/jpeg image/gif image/png],
                                    message: 'must be a valid image format' },
                    size: { less_than: 5.megabytes,
                            message: 'should be less than 5MB' }
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

  def comments_count
    self[:comments_count]
  end

  # 画像投稿機能 ----------------------------------------------------------------
  has_many_attached :images, dependent: :purge_later # 投稿は4枚の画像を持つ

  private

  def image_count
    errors.add(:images, 'は4枚まで添付できます') if images.size > 4
  end
end
