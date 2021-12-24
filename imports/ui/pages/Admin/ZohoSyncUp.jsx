import React from 'react';
import {
  Row, Col, Panel,
} from 'react-bootstrap';
import { syncBulkOrdersWithZoho, getOrdersAndInvoicesFromZoho, syncOfflinePaymentDetails } from '../../../api/ZohoSyncUps/zohoOrdersMethods';
import { bulkSyncProductsZoho } from '../../../api/ZohoSyncUps/zohoProductsMethods';
import { bulkSyncUsersZoho } from '../../../api/ZohoSyncUps/zohoContactsMethods';
import getSalesDetailsByItemFromZoho from '../../../api/ZohoSyncUps/zohoSalesByItemsMethods';
import ZohoSync from '../../components/ZohoSync/ZohoSync';

const showButton = () => {
  const today = new Date();
  const hours = today.getHours();
  if (hours < 9 || hours > 19) {
    return true;
  }
  return false;
};

const ZohoSyncUp = () => (
  <div>
    <h2 className="page-header">Sync With Zoho Books</h2>
    <Panel>
      <Row>
        <Col xs={12}>
          <ZohoSync
            orderSequence={1}
            syncFunction={bulkSyncUsersZoho}
            syncName="Sync Users >"
            syncDescription="Send user updates to Zoho"
          />

          <ZohoSync
            orderSequence={2}
            syncFunction={bulkSyncProductsZoho}
            syncName="Sync Products >"
            syncDescription="Send product updates to Zoho"
          />
          <ZohoSync
            orderSequence={3}
            syncFunction={syncBulkOrdersWithZoho}
            syncName="Send Pending Orders >"
            syncDescription="Send details of pending orders to Zoho and update status to Awaiting Fulfillment"
          />
          <hr />
          <ZohoSync
            orderSequence={4}
            syncFunction={getOrdersAndInvoicesFromZoho} // {getOrdersFromZoho}
            syncName="< Get Invoices "
            syncDescription="Get invoice details of orders from Zoho"
          />
          <ZohoSync
            orderSequence={5}
            syncFunction={getSalesDetailsByItemFromZoho}
            syncName="< Update Returns"
            syncDescription="Update returns"
          />
          <hr />
          <ZohoSync
            orderSequence={6}
            syncFunction={syncOfflinePaymentDetails}
            disabled={!showButton()}
            syncName="< Update Offline Payments"
            syncDescription="Update invoice and payment details from Zoho. Will be enabled before 9am and after 7 PM."
          />
        </Col>
      </Row>
    </Panel>
  </div>
);

export default ZohoSyncUp;
