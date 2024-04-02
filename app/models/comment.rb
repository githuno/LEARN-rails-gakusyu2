class Comment < ApplicationRecord
  after_create :send_new_comment_email

  belongs_to :user
  belongs_to :post, counter_cache: true

  validates :content, length: { minimum: 1, maximum: 140 }

  private

  def send_new_comment_email
    CommentMailer.new_comment_email(self).deliver_later
  end
end
