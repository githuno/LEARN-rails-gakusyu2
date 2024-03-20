
curl --create-dirs -o $HOME/.postgresql/root.crt 'https://cockroachlabs.cloud/clusters/3ab39bca-600c-46fb-8f4c-ff2397f89595/cert'

bundle exec rails db:migrate
bundle exec rails db:seed