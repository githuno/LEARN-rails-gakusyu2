class AddLikesCountToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :likes_count, :integer, default: 0
  end
end
# bulletによる注意
# カウンターキャッシュは、Active Recordの関連付けにおける一つの機能で、
# あるモデルが他のモデルに対して持つ関連付けの数をキャッシュ（保存）するためのものです。

# 例えば、あるPostがいくつのLikeを持っているかを知りたいとき、
# 通常は以下のようにlikes関連付けを通じてカウントを行います

# post.likes.count
# しかし、これを行うと毎回データベースへのクエリが発生します。これを解決するために、
# Postモデルにlikes_countというカラムを追加し、Likeが作成または削除されるたびに
# このカウンターキャッシュを更新することで、likesの数を効率的に取得することができます。

# post.likes_count
# これにより、likesの数を取得するためのデータベースへのクエリが不要になり、
# パフォーマンスが向上します。
# ただし、カウンターキャッシュはデータベースとモデルの両方で管理する必要があるため、
# の管理コストも考慮する必要があります。