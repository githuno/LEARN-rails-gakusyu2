class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('MAILER_SENDER', nil)
  layout 'mailer'
end
