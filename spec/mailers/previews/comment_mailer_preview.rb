# Preview all emails at http://localhost:3000/rails/mailers/comment_mailer
class CommentMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/comment_mailer/new_comment_email
  def new_comment_email
    comment = Comment.first
    CommentMailer.new_comment_email(comment)
  end
end
