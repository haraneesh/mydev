import { lazy } from 'react';

/* Suppliers */
export const dSuppliers = lazy(() => import('../pages/Admin/Suppliers/SuppliersHome/Suppliers'));
export const dNewSupplier = lazy(() => import('../pages/Admin/Suppliers/NewSupplier/NewSupplier'));
export const dViewSupplier = lazy(() => import('../pages/Admin/Suppliers/ViewSupplier/ViewSupplier'));
export const dEditSupplier = lazy(() => import('../pages/Admin/Suppliers/EditSupplier/EditSupplier'));
