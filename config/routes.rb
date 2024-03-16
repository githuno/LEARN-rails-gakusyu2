Rails.application.routes.draw do
  get 'users/show'
  devise_for :users
  resources :users, only: %i[show update]
  resources :users do
    member do
      get :following, :followers
      post :follow
      delete :unfollow
    end
  end
  resources :posts, only: %i[index new create] # %i[...] はシンボルの配列を作成するリテラルで[:index, :new, :create]と同じ
  get 'timeline', to: 'posts#index'
  root 'posts#index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
