class Like < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: true

  validates :user_id, uniqueness: { scope: :post_id } # いいねはユーザーごとに投稿に一つまで
  validate :cannot_like_own_post # 自分の投稿にはいいねできない

  private

  def cannot_like_own_post
    errors.add(:user_id, 'cannot like own post') if user_id == post.user_id
  end
end
