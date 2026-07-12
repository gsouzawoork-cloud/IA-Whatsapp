-- 0013_indexes.sql
-- Índices complementares para os caminhos de consulta multiempresa mais comuns.
-- (Índices essenciais já foram criados junto de cada tabela; aqui ficam os
-- compostos voltados a filtros por tenant + estado.)

create index if not exists idx_products_org_category on public.products (organization_id, category);
create index if not exists idx_delivery_zones_org_active on public.delivery_zones (organization_id, is_active);
create index if not exists idx_customers_org_phone on public.customers (organization_id, phone_normalized);
create index if not exists idx_orders_org_created on public.orders (organization_id, created_at desc);
create index if not exists idx_conversations_org_status on public.conversations (organization_id, status);
create index if not exists idx_knowledge_org_active on public.knowledge_items (organization_id, is_active, priority desc);
