FactoryBot.define do
  factory :comment do
    content { 'Test Comment' }
    user
    post
  end
end
