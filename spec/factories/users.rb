FactoryBot.define do
  factory :user do
    username { 'testuser' }
    email { 'testuser@example.com' }
    password { 'password' }
  end

  factory :random_user, class: 'User' do
    sequence(:username) { |_n| "testuser#{('a'..'z').to_a.sample(8).join}" }
    sequence(:email) { |_n| Faker::Internet.unique.email }
    password { 'password' }
  end
end
