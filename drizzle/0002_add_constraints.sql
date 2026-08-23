-- Business rule: Only one pricing package can be popular
CREATE UNIQUE INDEX unique_popular_package ON pricing_packages (is_popular) WHERE is_popular = true;

-- Singleton enforcement (application-level check with unique indexes)
CREATE UNIQUE INDEX singleton_site_settings ON site_settings ((1));
CREATE UNIQUE INDEX singleton_hero_content ON hero_content ((1));
CREATE UNIQUE INDEX singleton_about_content ON about_content ((1));
CREATE UNIQUE INDEX singleton_contact_info ON contact_info ((1));

-- Performance indexes
CREATE INDEX idx_services_display_order ON services(display_order);
CREATE INDEX idx_previous_works_display_order ON previous_works(display_order);
CREATE INDEX idx_pricing_packages_display_order ON pricing_packages(display_order);
CREATE INDEX idx_pricing_features_package_id ON pricing_features(package_id);
CREATE INDEX idx_social_links_display_order ON social_links(display_order);
CREATE INDEX idx_about_features_display_order ON about_features(display_order);
CREATE INDEX idx_about_stats_display_order ON about_stats(display_order);

-- Visibility indexes
CREATE INDEX idx_services_visible ON services(is_visible) WHERE is_visible = true;
CREATE INDEX idx_previous_works_visible ON previous_works(is_visible) WHERE is_visible = true;
CREATE INDEX idx_pricing_packages_visible ON pricing_packages(is_visible) WHERE is_visible = true;
CREATE INDEX idx_social_links_visible ON social_links(is_visible) WHERE is_visible = true;
CREATE INDEX idx_about_stats_visible ON about_stats(is_visible) WHERE is_visible = true;