class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller? # devise(ユーザー認証)
  before_action :basic_auth, if: :production? # production環境でのみBasic認証

  protected

  # devise(ユーザー認証)に関するストロングパラメーターの設定
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[username email])
    devise_parameter_sanitizer.permit(:account_update, keys: %i[username email])
  end

  private

  def production?
    Rails.env.production?
  end

  # Basic認証
  def basic_auth
    authenticate_or_request_with_http_basic do |username, password|
      username == ENV['BASIC_AUTH_USERNAME'] && password == ENV['BASIC_AUTH_PASSWORD']
    end
  end
end
