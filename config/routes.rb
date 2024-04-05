Rails.application.routes.draw do
  root 'posts#index'

  devise_for :users
  resources :users, only: %i[show update]
  get 'users/:id/show_json', to: 'users#show_json', as: 'user_show_json'
  resources :users do
    member do
      post :toggle_follow
    end
  end

  resources :posts, only: %i[create update destroy] do
    member do
      post :toggle_like
      get :likers
      resources :comments, only: %i[create index]
    end
  end
  get 'timeline', to: 'posts#index'
  get 'timeline/followings', to: 'posts#idx_followings'
  get 'timeline/user/:id', to: 'posts#idx_user', as: 'timeline_user'
  get 'timeline/likes', to: 'posts#idx_likes', as: 'timeline_likes'
  get 'posts/more', to: 'posts#more_posts', as: 'more_posts'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
