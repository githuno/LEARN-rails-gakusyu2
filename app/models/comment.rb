class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: true

  validates :content, length: { minimum: 1, maximum: 140 }
end
