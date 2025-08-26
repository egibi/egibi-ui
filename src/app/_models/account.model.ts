import { EntityBase } from "./entity-base.model";
import { AccountDetails } from "./account-details.model";
export class Account extends EntityBase{
    isNewAccount: boolean;
    accountDetails?: AccountDetails | null;
}