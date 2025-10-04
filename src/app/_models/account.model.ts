import { EntityBase } from "./entity-base.model";
import { AccountDetails } from "./account-details.model";
import { AccountUser } from "./account-user.model";
export class Account extends EntityBase{
    isNewAccount: boolean;
    accountUser: AccountUser; 
    
}