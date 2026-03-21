import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { syncBulkOrdersWithZoho, syncOfflinePaymentDetails } from '../../../api/ZohoSyncUps/zohoOrdersMethods';
import { getInvoicesFromZohoByLastModifiedTime } from '../../../api/ZohoSyncUps/zohoInvoices';
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
  <div className="p-1 pb-4">
    <h2 className="py-4">Sync With Zoho Books</h2>
    <Row className="bg-body m-2 p-2">
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
          syncName="Send Processing Orders >"
          syncDescription="Send details of 'Processing' orders to Zoho and update status to Awaiting Fulfillment"
        />
        <hr />
        <ZohoSync
          orderSequence={4}
          syncFunction={getInvoicesFromZohoByLastModifiedTime}
          syncName="< Get Updated Invoices"
          syncDescription="Get invoice details modified since last sync from Zoho"
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
  </div>
);

export default ZohoSyncUp;
