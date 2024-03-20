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
end
