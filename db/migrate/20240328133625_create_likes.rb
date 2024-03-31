class CreateLikes < ActiveRecord::Migration[7.0]
  def change
    create_table :likes do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid # uuidの場合は明示的に指定
      t.references :post, null: false, foreign_key: true

      t.timestamps
    end
    add_index :likes, %i[user_id post_id], unique: true
  end
end
