import { AddressInfo } from "net";

export const isAddressInfo = (obj: any): obj is AddressInfo => !!obj.address;
