FactoryBot.define do
  factory :user do
    username { 'testuser' }
    password { 'password' }
  end

  factory :random_user, class: 'User' do
    sequence(:username) { |_n| "testuser#{('a'..'z').to_a.sample(8).join}" }
    password { 'password' }
  end
end
