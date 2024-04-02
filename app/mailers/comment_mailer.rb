class CommentMailer < ApplicationMailer
  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.comment_mailer.new_comment_email.subject
  #
  def new_comment_email(comment)
    @comment = comment
    @class_name = self.class.name
    @action = action_name
    @app_link = ENV.fetch('APP_LINK', 'https://mac-sonic.tail55100.ts.net:8443/')
    @greeting = "いつもありがとう、#{comment.user.username}！新しいお知らせです。"
    mail(to: @comment.user.email, subject: '新しいコメントが投稿されました')
  end
end
