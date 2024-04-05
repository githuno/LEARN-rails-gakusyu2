class CommentMailer < ApplicationMailer
  def new_comment_email(comment)
    @comment = comment
    @class_name = self.class.name
    @action = action_name
    @app_link = ENV.fetch('APP_LINK', 'https://mac-sonic.tail55100.ts.net:8443/')
    @greeting = "いつもありがとう、#{comment.post.user.username}！新しいお知らせです。"
    mail(to: @comment.post.user.email, subject: '新しいコメントが投稿されました')
  end
end
