# ユーザーのダミーデータを作成
10.times do
  User.create!(
    username: Faker::Internet.unique.username(specifier: 5..20, separators: []),
    email: Faker::Internet.unique.email,
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
  (Post.all - user.posts).sample(30).each do |post|
    post.likes.create!(user_id: user.id)
  end

  # ランダムにフォローする
  (User.all - [user]).sample(30).each do |other_user|
    user.follow(other_user)
  end

  # ランダムにコメントをする
  (Post.all - user.posts).sample(10).each do |post|
    post.comments.create!(
      user_id: user.id,
      content: Faker::Lorem.sentence(word_count: 10)
    )
  end
end
