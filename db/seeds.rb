# ユーザーのダミーデータを作成
10.times do
  User.create!(
    username: Faker::Internet.unique.username(specifier: 5..20, separators: []),
    password: 'password',
    password_confirmation: 'password',
    profile: Faker::Lorem.sentence(word_count: 10),
    blog_url: Faker::Internet.url
  )
end

# ユーザーごとにポストのダミーデータを作成
User.all.each do |user|
  5.times do
    user.posts.create!(
      content: Faker::Lorem.sentence(word_count: 10)
    )
  end

  # ランダムにいいねをする
  Post.all.sample(3).each do |post|
    post.likes.create!(user_id: user.id)
  end

  # ランダムにフォローする
  User.all.sample(3).each do |followed_user|
    user.follow(followed_user)
  end
end
