/* eslint-disable @typescript-eslint/ban-types */
import type { ColumnType as ICol } from 'rc-table/lib/interface';
import { type EOperatorType } from './constant';

export interface IColumn<T> extends Omit<ICol<T>, 'dataIndex' | 'width'> {
  /** Ẩn cột khi hiển thị trên table, nhưng vẫn có trong filter, import, export */
  hide?: boolean;

  children?: IColumn[];

  /** Cho phép sắp xếp hay ko, thường chỉ nên cho sắp xêp các trường: Mã, tên (ngắn), số lượng, ngày */
  sortable?: boolean;

  /** Data để filter với trường họp chọn filterType là 'select' */
  filterData?: string[] | TDataOption[];

  /** Các loại filter, đối với
   * - 'customselect' thì phải có 'filterCustomSelect'
   * - 'select' thì phải có 'filterData' */
  filterType?: 'string' | 'number' | 'date' | 'datetime' | 'select' | 'customselect';

  /** JSX Element trả về 1 mảng value, thường là id */
  filterCustomSelect?: JSX.Element;

  dataIndex?: keyof T | 'index' | string[];

  /** Bắt buộc phải có
   * Lưu ý: độ rộng phải fit tương đối với nội dung của column, ko để quá rộng, hẹp
   * Phải check cả ở mobile view
   */
  width: number;
}

export type TDataOption = {
  label: string;
  value: string | number;
};

export type TableBaseProps = {
  /** Tên model */
  modelName: any;

  Form?: React.FC;
  formType?: 'Modal' | 'Drawer';
  columns: IColumn<any>[];
  title?: React.ReactNode;
  widthDrawer?: string | number;

  /** Hàm getData tùy chỉnh, nếu ko có thì 'getModel' của model sẽ là mặc định */
  getData?: Function;

  /** Tham số phụ thuộc để getData được gọi */
  dependencies?: any[];

  /** Tham số để truyền vào hàm getData */
  params?: any;

  /** Các nội dung hiển thị trên header, bên cạnh button thêm mới */
  children?: React.ReactNode;

  border?: boolean;

  /** Tùy chọn các nút mặc định */
  buttons?: {
    /** Được thêm mới ko? Mặc định: Có */
    create?: boolean;
    /** Được nhập dữ liệu ko? Mặc định: Có */
    import?: boolean;
    /** Được xuất dữ liệu ko? Mặc định: Có */
    export?: boolean;
    /** Được lọc tùy chỉnh ko? Mặc định: Có */
    filter?: boolean;
    /** Có nút tải lại ko? Mặc định: Có */
    reload?: boolean;
  };

  /** Danh sách các nút khác bên cạnh Thêm mới */
  otherButtons?: JSX.Element[];

  /** Biến lưu dữ liệu trong model, Mặc định: danhSach */
  dataState?: string;

  otherProps?: TableProps<any>;

  /** Click vào mask để đóng form ko? Mặc định: Không */
  maskCloseableForm?: boolean;

  noCleanUp?: boolean;

  rowSelection?: boolean;
  detailRow?: any;

  /** Tên trường dữ liệu gắn thêm
   * Ví dụ nếu trong model là 'danhSachNhanVien' thì cần truyền vào là 'NhanVien' */
  newName?: string;

  hideTotal?: boolean;
  pageable?: boolean;
  hideCard?: boolean;

  /** Text hiển thị khi ko có dữ liệu */
  emptyText?: string;

  /** Ko cần thiết */
  scroll?: { x?: number; y?: number };

  formProps?: any;

  /** Có destroy Modal sau khi thêm mới, chỉnh sửa ko? Mặc định: Không */
  destroyModal?: boolean;

  /** Có thêm cột STT ko? Mặc định: Có */
  addStt?: boolean;

  /** Modal có toàn màn hình ko? Mặc định: Không */
  fullScreen?: boolean;
};

export type TFilter<T> = {
  field: keyof T;
  operator?: EOperatorType;
  values: (string | number)[];
  active: boolean;
};
